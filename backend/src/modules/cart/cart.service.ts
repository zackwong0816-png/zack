import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Cart, CartDocument } from './cart.schema'

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(memberId: string) {
    let cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) { cart = await this.cartModel.create({ memberId: new Types.ObjectId(memberId), items: [] }) }
    return cart.items
  }

  async addItem(memberId: string, productId: string, name: string, price: number, quantity: number) {
    let cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) { cart = await this.cartModel.create({ memberId: new Types.ObjectId(memberId), items: [] }) }
    const idx = cart.items.findIndex(i => i.productId === productId)
    if (idx > -1) { cart.items[idx].quantity += quantity } else { cart.items.push({ productId, name, price, quantity }) }
    await cart.save()
    return cart.items
  }

  async updateItem(memberId: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) return []
    const idx = cart.items.findIndex(i => i.productId === productId)
    if (idx > -1) {
      if (quantity <= 0) cart.items.splice(idx, 1)
      else cart.items[idx].quantity = quantity
    }
    await cart.save()
    return cart.items
  }

  async removeItem(memberId: string, productId: string) {
    const cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) return []
    cart.items = cart.items.filter(i => i.productId !== productId)
    await cart.save()
    return cart.items
  }

  async clear(memberId: string) {
    await this.cartModel.findOneAndUpdate({ memberId: new Types.ObjectId(memberId) }, { items: [] })
    return []
  }
}

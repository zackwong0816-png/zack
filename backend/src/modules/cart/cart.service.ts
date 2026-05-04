import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Cart, CartDocument } from './cart.schema'
import { Product, ProductDocument } from '../products/products.schema'

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(memberId: string) {
    let cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) {
      cart = await this.cartModel.create({ memberId: new Types.ObjectId(memberId), items: [] })
    }
    return cart.items
  }

  async addItem(memberId: string, productId: string, quantity: number) {
    const product = await this.productModel.findById(productId)
    if (!product) throw new BadRequestException('商品不存在')
    if (product.stock < quantity) throw new BadRequestException(`库存不足，剩余 ${product.stock}`)

    let cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) {
      cart = await this.cartModel.create({ memberId: new Types.ObjectId(memberId), items: [] })
    }
    const idx = cart.items.findIndex(i => i.productId === productId)
    if (idx > -1) {
      const newQty = cart.items[idx].quantity + quantity
      if (product.stock < newQty) throw new BadRequestException(`库存不足，剩余 ${product.stock}`)
      cart.items[idx].quantity = newQty
    } else {
      cart.items.push({ productId, name: product.name, price: product.price, quantity })
    }
    await cart.save()
    return cart.items
  }

  async updateItem(memberId: string, productId: string, quantity: number) {
    const product = await this.productModel.findById(productId)
    if (!product) throw new BadRequestException('商品不存在')
    if (quantity < 0) throw new BadRequestException('数量不能为负')

    const cart = await this.cartModel.findOne({ memberId: new Types.ObjectId(memberId) })
    if (!cart) return []
    const idx = cart.items.findIndex(i => i.productId === productId)
    if (idx === -1) throw new BadRequestException('购物车中无此商品')

    if (quantity === 0) {
      cart.items.splice(idx, 1)
    } else {
      if (product.stock < quantity) throw new BadRequestException(`库存不足，剩余 ${product.stock}`)
      cart.items[idx].quantity = quantity
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

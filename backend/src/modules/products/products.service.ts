import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Product, ProductDocument, Category, CategoryDocument } from './products.schema'
import { CreateProductDto, UpdateProductDto } from './products.dto'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(query: any) {
    const filter: any = {}
    if (query.status) filter.status = query.status
    if (query.category) filter.category = new Types.ObjectId(query.category)
    if (query.keyword) {
      const safeKeyword = escapeRegex(String(query.keyword))
      filter.$or = [
        { name: { $regex: safeKeyword, $options: 'i' } },
        { desc: { $regex: safeKeyword, $options: 'i' } },
      ]
    }

    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.productModel.find(filter).populate('category').skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.productModel.countDocuments(filter),
    ])

    return { items, total, page, pages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('无效的商品ID')
    const product = await this.productModel.findById(id).populate('category')
    if (!product) throw new BadRequestException('产品不存在')
    return product
  }

  async create(dto: CreateProductDto) {
    return this.productModel.create(dto)
  }

  async update(id: string, dto: UpdateProductDto) {
    return this.productModel.findByIdAndUpdate(id, dto, { new: true })
  }

  async delete(id: string) {
    return this.productModel.findByIdAndDelete(id)
  }

  async findAllCategories() {
    return this.categoryModel.find().sort({ sort: 1 })
  }

  async createCategory(data: Partial<Category>) {
    return this.categoryModel.create(data)
  }

  async updateCategory(id: string, data: Partial<Category>) {
    return this.categoryModel.findByIdAndUpdate(id, data, { new: true })
  }

  async seedProducts() {
    const count = await this.productModel.countDocuments()
    if (count > 0) return

    const cats = await this.categoryModel.insertMany([
      { name: '数码电子', slug: 'electronics', sort: 1 },
      { name: '家居生活', slug: 'home', sort: 2 },
      { name: '服饰配饰', slug: 'fashion', sort: 3 },
      { name: '护肤美妆', slug: 'beauty', sort: 4 },
    ])

    const products = [
      { name: 'NOVA 无线蓝牙耳机', desc: '降噪设计，续航30小时，高保真音质', price: 299, originalPrice: 399, category: cats[0]._id, tags: ['热销', '新品'], stock: 200, sales: 1580, rating: 4.8, status: 'active' },
      { name: 'NOVA 智能手表 Pro', desc: '全屏触控，心率监测，防水防尘', price: 1299, originalPrice: 1599, category: cats[0]._id, tags: ['新品'], stock: 80, sales: 620, rating: 4.6, status: 'active' },
      { name: 'NOVA 香薰机 静音版', desc: '超声波雾化，静音设计，LED氛围灯', price: 159, originalPrice: 199, category: cats[1]._id, tags: ['热销'], stock: 350, sales: 2100, rating: 4.7, status: 'active' },
      { name: 'NOVA 记忆棉靠垫', desc: '人体工学设计，缓解腰部压力', price: 89, category: cats[1]._id, tags: [], stock: 500, sales: 3200, rating: 4.5, status: 'active' },
      { name: 'NOVA 纯棉卫衣 简约款', desc: '100%纯棉，宽松版型，多色可选', price: 199, originalPrice: 259, category: cats[2]._id, tags: ['新品'], stock: 300, sales: 890, rating: 4.4, status: 'active' },
      { name: 'NOVA 精华液 30ml', desc: '深层补水，提亮肤色，温和不刺激', price: 168, originalPrice: 218, category: cats[3]._id, tags: ['热销'], stock: 150, sales: 4500, rating: 4.9, status: 'active' },
    ]

    await this.productModel.insertMany(products)
  }
}

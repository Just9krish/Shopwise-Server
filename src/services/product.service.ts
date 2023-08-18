import Product, { ProductDocument } from "../models/product.model";
import Shop, { ShopDocument } from "../models/shop.model";
import ErrorHandler from "../utils/errorHandler";

interface ProductInput {
  name: string;
  description: string;
  category: string;
  tags?: string;
  price: number;
  discount_percentage?: number;
  discount_price?: number;
  stock: number;
  sold_out: number;
}

export const addProduct = async (
  productData: ProductInput,
  imageUrls: any[],
  shopId: string
): Promise<ProductDocument> => {
  try {
    const shop = await Shop.findById(shopId);

    if (!shop) {
      throw new ErrorHandler("Invalid Seller id", 400);
    }

    const product = await Product.create({
      ...productData,
      images: imageUrls,
      shop: shopId,
    });

    return product;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getAllProducts = async () => {
  try {
    const products = await Product.find().populate("shop");
    return products;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

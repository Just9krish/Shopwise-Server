import Product, { ProductDocument } from "../models/product.model";
import Shop from "../models/shop.model";
import ErrorHandler from "../utils/errorHandler";

interface ProductInput {
  name: string;
  description: string;
  category: string;
  brand: string;
  tags?: string;
  price: number;
  discountPercentage?: number;
  discountPrice?: number;
  stock: number;
  soldOut: number;
}

interface QueryParameters {
  category?: string;
  brand?: string;
  _sort?: string;
  _order?: string;
  _page?: string;
  _limit?: string;
}

function generateRandomNumber() {
  const min = 1;
  const max = 5;
  const randomNumber = Math.random() * (max - min) + min;
  return randomNumber.toFixed(2); // Limit to 2 decimal places
}

export const addProduct = async (
  productData: ProductInput,
  imageUrls: any[],
  shopId: string
): Promise<ProductDocument> => {
  try {
    const shop = await Shop.findById(shopId);

    if (!shop) {
      throw new ErrorHandler("Invalid shop id", 400);
    }

    const rating = generateRandomNumber();

    const product = await Product.create({
      ...productData,
      images: imageUrls,
      shop: shopId,
      rating,
    });

    return product;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getAllProducts = async (queryParameters: QueryParameters) => {
  try {
    const condition: any = {};

    if (queryParameters.category) {
      condition.category = { $in: queryParameters.category.split(",") };
    }

    if (queryParameters.brand) {
      condition.brand = { $in: queryParameters.brand.split(",") };
    }

    console.log(condition)

    let productQuery: any = Product.find(condition);

    if (queryParameters._sort && queryParameters._order) {
      const sortQuery: { [key: string]: string; } = {}; // Specify key-value types
      sortQuery[queryParameters._sort] = queryParameters._order;
      productQuery = productQuery.sort(sortQuery);
    }

    const totalDocs = await Product.countDocuments(condition).exec();

    if (queryParameters._page && queryParameters._limit) {
      const pageSize = parseInt(queryParameters._limit);
      const page = parseInt(queryParameters._page);
      productQuery = productQuery.skip(pageSize * (page - 1)).limit(pageSize);
    }

    productQuery.populate("shop");

    const products = await productQuery.exec();

    return { products, totalDocs };
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getProductById = async (productId: string) => {
  try {
    const product = await Product.findById(productId).populate("shop");
    return product;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getBestDealProducts = async () => {
  try {
    const bestDealProducts = await Product.find({})
      .sort({ discountPercentage: -1 })
      .limit(5);

    return bestDealProducts;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

export const getFeaturedProducts = async () => {
  try {
    const featuredProducts = await Product.find()
      .sort({ soldOut: -1 })
      .limit(5);

    return featuredProducts;
  } catch (error: any) {
    throw new ErrorHandler(error.message, error.statusCode || 500);
  }
};

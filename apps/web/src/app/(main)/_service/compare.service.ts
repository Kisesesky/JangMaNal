import type { CompareFilter, CompareProductItem } from '../_model/product.model';

const products: CompareProductItem[] = [
  {
    id: 'emart-strawberry-1',
    mart: 'emart',
    category: '과일',
    name: '이마트 딸기 750g',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
    price: 12900,
    popularity: 90,
  },
  {
    id: 'lotte-strawberry-1',
    mart: 'lotte',
    category: '과일',
    name: '롯데마트 딸기 500g',
    imageUrl: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800',
    price: 9800,
    popularity: 78,
  },
  {
    id: 'homeplus-milk-1',
    mart: 'homeplus',
    category: '유제품',
    name: '홈플러스 1A 우유 1L',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
    price: 2780,
    popularity: 88,
  },
  {
    id: 'kurly-salad-1',
    mart: 'marketkurly',
    category: '채소',
    name: '마켓컬리 샐러드 믹스',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    price: 5500,
    popularity: 75,
  },
  {
    id: 'wisely-dumpling-1',
    mart: 'wisely',
    category: '냉동식품',
    name: '와이즐리 군만두 1kg',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800',
    price: 8900,
    popularity: 92,
  },
  {
    id: 'emart-meal-1',
    mart: 'emart',
    category: '간편식',
    name: '이마트 즉석 컵밥 세트',
    imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800',
    price: 4900,
    popularity: 70,
  },
];

export const compareService = {
  async listProducts(filter: CompareFilter) {
    const keyword = filter.keyword.trim().toLowerCase();

    let result = products.filter((item) => {
      const byKeyword = keyword.length === 0 || item.name.toLowerCase().includes(keyword);
      const byCategory = filter.category === '전체' || item.category === filter.category;
      return byKeyword && byCategory;
    });

    if (filter.sort === 'price_asc') {
      result = result.sort((a, b) => a.price - b.price);
    }

    if (filter.sort === 'popularity_desc') {
      result = result.sort((a, b) => b.popularity - a.popularity);
    }

    return Promise.resolve(result);
  },

  async getAdminSummary() {
    const martCount = Array.from(new Set(products.map((item) => item.mart))).length;
    const categoryCount = Array.from(new Set(products.map((item) => item.category))).length;

    return Promise.resolve({
      productCount: products.length,
      martCount,
      categoryCount,
      averagePrice: Math.round(products.reduce((sum, item) => sum + item.price, 0) / products.length),
    });
  },
};

export const mockOrders = [
  {
    id: 1,
    orderNo: 'XY202401150001',
    status: 'PAID',
    totalAmount: 9999,
    totalQuantity: 1,
    items: [
      { id: 1, name: 'iPhone 15 Pro Max', spec: '颜色：银色', price: 9999, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=iphone%2015%20pro%20max%20smartphone%20product%20photo%20white%20background&image_size=square' }
    ]
  },
  {
    id: 2,
    orderNo: 'XY202401140002',
    status: 'COMPLETED',
    totalAmount: 17998,
    totalQuantity: 2,
    items: [
      { id: 2, name: 'MacBook Pro 14寸', spec: '配置：M3 Pro', price: 14999, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=macbook%20pro%2014%20inch%20laptop%20product%20photo%20white%20background&image_size=square' },
      { id: 3, name: '索尼WH-1000XM5', spec: '颜色：黑色', price: 2999, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=sony%20wh1000xm5%20headphones%20black%20product%20photo%20white%20background&image_size=square' }
    ]
  },
  {
    id: 3,
    orderNo: 'XY202401130003',
    status: 'PENDING',
    totalAmount: 5998,
    totalQuantity: 2,
    items: [
      { id: 4, name: 'AirPods Pro 2', spec: '标准版', price: 1899, quantity: 2, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=apple%20airpods%20pro%202%20earbuds%20product%20photo%20white%20background&image_size=square' },
      { id: 5, name: '小米14 Pro', spec: '颜色：黑色', price: 4099, quantity: 1, image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=xiaomi%2014%20pro%20smartphone%20product%20photo%20white%20background&image_size=square' }
    ]
  }
]

import { useAtom, useSetAtom } from 'jotai'
import { persistCartAtom } from '../atoms/cart'
import type { CartItem, Product, Customization } from '../../../types'
import { generateId } from '../utils'

export function useCart() {
  const [cart, setCart] = useAtom(persistCartAtom)

  const addItem = (
    product: Product,
    quantity: number,
    customizations: Record<string, string[]>
  ) => {
    const customizationPrice = Object.entries(customizations).reduce((sum, [key, valueIds]) => {
      const customization = product.customizations?.find((c) => c.id === key)
      if (!customization) return sum
      return (
        sum +
        valueIds.reduce((itemSum, valueId) => {
          const option = customization.options.find((o) => o.id === valueId)
          return itemSum + (option?.price || 0)
        }, 0)
      )
    }, 0)

    const unitPrice = product.price + customizationPrice
    const newItem: CartItem = {
      id: generateId(),
      productId: product.id,
      vendorId: product.vendorId,
      product,
      quantity,
      customizations,
      unitPrice,
      totalPrice: unitPrice * quantity,
    }

    setCart((prev) => [...prev, newItem])
  }

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const deliveryFee = cart.length > 0 ? 3.99 : 0
    const tax = subtotal * 0.1
    const total = subtotal + deliveryFee + tax

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
    }
  }

  const getItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotals,
    getItemCount,
  }
}


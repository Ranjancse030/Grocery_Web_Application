import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body

    console.log('Request body:', req.body)
    console.log('User:', req.user)

    if (orderItems && orderItems.length === 0) {
      res.status(400)
      throw new Error('No order items')
    }

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      res.status(400)
      throw new Error('Missing required fields')
    }

    const order = new Order({
      orderItems: orderItems.map(item => ({
        ...item,
        product: item.product, // Ensure this is the product ID
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })

    console.log('Order to save:', order)

    const createdOrder = await order.save()
    console.log('Created order:', createdOrder)

    res.status(201).json(createdOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500)
    throw error
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    )

    if (order) {
      res.json(order)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } catch (error) {
    console.error('Error getting order:', error)
    res.status(500)
    throw error
  }
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      }

      const updatedOrder = await order.save()

      res.json(updatedOrder)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } catch (error) {
    console.error('Error updating order to paid:', error)
    res.status(500)
    throw error
  }
})

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (order) {
      order.isDelivered = true
      order.deliveredAt = Date.now()

      const updatedOrder = await order.save()

      res.json(updatedOrder)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } catch (error) {
    console.error('Error updating order to delivered:', error)
    res.status(500)
    throw error
  }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
  } catch (error) {
    console.error('Error getting my orders:', error)
    res.status(500)
    throw error
  }
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name')
    res.json(orders)
  } catch (error) {
    console.error('Error getting all orders:', error)
    res.status(500)
    throw error
  }
})

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // Check if order belongs to user or if user is admin
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401)
    throw new Error('Not authorized')
  }

  // Check if order can be cancelled
  if (order.status === 'delivered') {
    res.status(400)
    throw new Error('Cannot cancel delivered order')
  }

  if (order.status === 'cancelled') {
    res.status(400)
    throw new Error('Order is already cancelled')
  }

  order.status = 'cancelled'
  const updatedOrder = await order.save()
  res.json(updatedOrder)
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
}

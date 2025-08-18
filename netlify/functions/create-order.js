/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const Razorpay = require('razorpay')

const PRICE_MAP = { "registration_price": 1100 }

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        }
    }

    try {
        const { eventCode, qty = 1, customer } = JSON.parse(event.body || '{}')
        const unit = PRICE_MAP[eventCode]
        if (!unit) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid event code' }) }
        const amount = unit * Math.max(1, +qty)

        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        let order 
        rzp.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt#${Date.now()}`,
            payment_capture: 1,
            notes: { eventCode, qty: String(qty), email: customer?.email || '' },
        }, function (error, orderResponse) {
            order = orderResponse
            if (error) {
                console.error('Error creating order:', error)
                return {
                    statusCode: 500,
                    body: error.message || 'Internal Server Error'
                }
            }
        })

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId: order.id, amount, currency: 'INR' })
        }

    } catch (error) {
        console.error('Error creating order:', error)
        return {
            statusCode: 500,
            body: error.message || 'Internal Server Error'
        }
    }
}
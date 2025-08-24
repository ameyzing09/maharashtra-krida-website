import Razorpay from 'razorpay'

const PRICE_MAP = { "registration_price": 110000 }

export const handler = async (event) => {
    console.log('Received event:', event)
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
        console.log('Creating order for:', { eventCode, qty, amount, customer })
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const order = await new Promise((resolve, reject) => {
            rzp.orders.create({
                amount,
                currency: 'INR',
                receipt: `receipt#${Date.now()}`,
                payment_capture: 1,
                notes: { eventCode, qty: String(qty), email: customer?.email || '' },
            }, function (error, orderResponse) {
                if (error) {
                    reject(error);
                } else {
                    resolve(orderResponse);
                }
            });
        });
        console.log('Order created:', order)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID })
        }

    } catch (error) {
        console.error('Error creating order:', error)
        return {
            statusCode: 500,
            body: error.message || 'Internal Server Error'
        }
    }
}
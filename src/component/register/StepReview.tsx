import { useRegistrationContext } from "../../hook/useRegistration";

export default function StepReview() {
    const { state, dispatch } = useRegistrationContext();
    const { attendee, priceBreakup } = state;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Your details </h3>
                <div className="bg-gray-50 rounded p-4 text-sm">
                    <div><b>Name:</b> {attendee?.name}</div>
                    <div><b>Mobile:</b> {attendee?.phone}</div>
                    <div><b>Email:</b> {attendee?.companyEmail}</div>
                    {attendee?.other && <div><b>Other:</b> {attendee.other}</div>}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Price Breakup</h3>
                <div className="bg-gray-50 rounded p-4">
                    <div className="flex justify-between mb-1">
                        <span>Registration Fee</span><span>₹{(priceBreakup.registrationFee / 100).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button onClick={() => dispatch({ type: "BACK" })} className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded">
                    Back
                </button>
                <button onClick={() => dispatch({ type: "NEXT" })} className="bg-lime-400 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded">
                    Proceed to Payment
                </button>
            </div>
        </div>
    )
}
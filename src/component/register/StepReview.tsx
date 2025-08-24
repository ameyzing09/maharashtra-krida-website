import { useRegistrationContext } from "../../hook/useRegistration";

export default function StepReview() {
    const { state, dispatch } = useRegistrationContext();
    const a = state.attendee;
    const amountRupees = (state.priceBreakup?.registrationFee ?? 0) / 100;

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Your details </h3>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between flex-wrap">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium break-words">{a?.name}</span>
                    </div>
                    <div className="flex justify-between flex-wrap">
                        <span className="text-gray-500">Mobile:</span>
                        <span className="font-medium">{a?.phone}</span>
                    </div>
                    <div className="flex justify-between flex-wrap">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium break-all">{a?.companyEmail}</span>
                    </div>
                    {a?.other && (
                        <div className="flex justify-between flex-wrap">
                            <span className="text-gray-500">Other:</span>
                            <span className="font-medium break-words">{a.other}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Amount card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Amount</h3>
                <div className="flex justify-between items-center text-base sm:text-lg">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">₹{amountRupees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <button
                    onClick={() => dispatch({ type: "BACK" })}
                    className="w-full sm:w-auto border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded"
                >
                    Back
                </button>
                <button
                    onClick={() => dispatch({ type: "NEXT" })}
                    className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-white font-semibold px-5 py-2.5 rounded"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
}
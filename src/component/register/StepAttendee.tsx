import z from "zod";
import { useRegistrationContext } from "../../hook/useRegistration";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    name: z.string().min(2, 'Enter full name'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
    other: z.string().optional(),
    companyEmail: z.string().email().refine(v => !/gmail|yahoo|outlook|hotmail/i.test(v),
        { message: 'Use company email, not personal' }),

})

type FormData = z.infer<typeof schema>;

export default function StepAttendee() {
    const { dispatch } = useRegistrationContext();
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    })
    const onSubmit = (data: FormData) => {
        dispatch({ type: 'SET_ATTENDEE', payload: data })
        const registrationFee = 1100
        dispatch({ type: 'SET_PRICE_BREAKUP', payload: { registrationFee } })
        dispatch({ type: 'NEXT' })
    }
    const input = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Full Name</label>
                <input className={input} placeholder="Jane Doe" {...register("name")} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Mobile Number</label>
                <input className={input} placeholder="9XXXXXXXXX" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Company Email</label>
                <input className={input} placeholder="you@company.com" {...register("companyEmail")} />
                {errors.companyEmail && <p className="text-red-500 text-xs mt-1">{errors.companyEmail.message}</p>}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Other (optional)</label>
                <input className={input} placeholder="Employee ID / Designation" {...register("other")} />
            </div>

            <div className="flex justify-between">
                <span />
                <button disabled={!isValid} className="bg-lime-400 hover:bg-lime-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded focus:outline-none">
                    Continue
                </button>
            </div>
        </form>
    )

}
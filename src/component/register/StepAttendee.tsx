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
    const { dispatch, state } = useRegistrationContext();
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: state.attendee || { name: '', phone: '', companyEmail: '', other: '' }
    })
    const onSubmit = (data: FormData) => {
        dispatch({ type: 'SET_ATTENDEE', payload: data })
        const registrationFee = 110000
        dispatch({ type: 'SET_PRICE_BREAKUP', payload: { registrationFee } })
        dispatch({ type: 'NEXT' })
    }
  const input = "w-full rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-brand-slate px-3 py-2 text-brand-charcoal dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/60";

     return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
        <input className={input} placeholder="Jane Doe" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      {/* Phone + Other side by side on desktop */}
      <div className="flex flex-col sm:flex-row sm:gap-4">
        <div className="flex-1 flex flex-col mb-4 sm:mb-0">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Mobile Number</label>
          <input className={input} inputMode="numeric" placeholder="9876543210" {...register("phone")} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Other (optional)</label>
          <input className={input} placeholder="Employee ID / Designation" {...register("other")} />
        </div>
      </div>

      {/* Company Email */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Email</label>
        <input className={input} type="email" placeholder="you@company.com" {...register("companyEmail")} />
        <p className="text-[11px] text-gray-500 mt-1">Work email only. Personal domains are not allowed.</p>
        {errors.companyEmail && <p className="text-xs text-red-600 mt-1">{errors.companyEmail.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className="w-full sm:w-auto rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:opacity-50 text-white font-semibold px-6 py-2.5"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

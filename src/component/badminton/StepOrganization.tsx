import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";

const officialEmail = z
  .string()
  .email("Enter a valid email")
  .refine((v) => !/gmail|yahoo|outlook|hotmail/i.test(v), {
    message: "Use your official / company email, not personal",
  });

const schema = z.object({
  companyName: z.string().min(2, "Enter company / organisation name"),
  contactPersonName: z.string().min(2, "Enter contact person's name"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  officialEmail,
  personalEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const input = "glass-input w-full px-3 py-2";
const labelCls = "text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

export default function StepOrganization() {
  const { state, dispatch } = useBadmintonRegistration();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: state.organization || {
      companyName: "",
      contactPersonName: "",
      phone: "",
      officialEmail: "",
      personalEmail: "",
    },
  });

  const onSubmit = (data: FormData) => {
    dispatch({
      type: "SET_ORG",
      payload: {
        companyName: data.companyName,
        contactPersonName: data.contactPersonName,
        phone: data.phone,
        officialEmail: data.officialEmail,
        personalEmail: data.personalEmail || undefined,
      },
    });
    dispatch({ type: "NEXT" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-col">
        <label className={labelCls}>Company / Organisation Name</label>
        <input className={input} placeholder="Acme Technologies Pvt. Ltd." {...register("companyName")} />
        {errors.companyName && (
          <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:gap-4">
        <div className="flex-1 flex flex-col mb-4 sm:mb-0">
          <label className={labelCls}>Primary Contact Person</label>
          <input className={input} placeholder="Jane Doe" {...register("contactPersonName")} />
          {errors.contactPersonName && (
            <p className="text-xs text-red-600 mt-1">{errors.contactPersonName.message}</p>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <label className={labelCls}>Mobile Number</label>
          <input className={input} inputMode="numeric" placeholder="9876543210" {...register("phone")} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="flex flex-col">
        <label className={labelCls}>Official Email</label>
        <input className={input} type="email" placeholder="you@company.com" {...register("officialEmail")} />
        <p className="text-[11px] text-gray-500 mt-1">
          Work email only. Personal domains (gmail, yahoo, etc.) are not allowed.
        </p>
        {errors.officialEmail && (
          <p className="text-xs text-red-600 mt-1">{errors.officialEmail.message}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label className={labelCls}>
          Personal Email <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input className={input} type="email" placeholder="you@example.com" {...register("personalEmail")} />
        {errors.personalEmail && (
          <p className="text-xs text-red-600 mt-1">{errors.personalEmail.message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
        <button type="submit" disabled={!isValid} className="glass-button-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </form>
  );
}

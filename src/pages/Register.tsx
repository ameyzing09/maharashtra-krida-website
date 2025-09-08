import Progress from "../component/register/Progress";
import StepAttendee from "../component/register/StepAttendee";
import StepPayment from "../component/register/StepPayment";
import StepReview from "../component/register/StepReview";
import { RegistrationProvider } from "../context/registrationContext";
import { useRegistrationContext } from "../hook/useRegistration";

function Steps() {
  const { state } = useRegistrationContext();
  const steps = [<StepAttendee key="att" />, <StepReview key="rev" />, <StepPayment key="pay" />];
  return <>{steps[state.step]}</>;
}

const Register = () => {
  return (
    <RegistrationProvider>
      <div className="mx-auto mt-6 w-full max-w-3xl px-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white mb-2">
          Register for Nyati Chess Tournament 2025
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Secure checkout powered by Razorpay.</p>
        <div className="mb-4 overflow-x-auto"><Progress /></div>
        <div className="rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 sm:p-6">
          <Steps />
        </div>
      </div>
    </RegistrationProvider>
  );
};

export default Register;

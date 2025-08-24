import Progress from "../component/register/Progress"
import StepAttendee from "../component/register/StepAttendee"
import StepPayment from "../component/register/StepPayment"
import StepReview from "../component/register/StepReview"
import { RegistrationProvider } from "../context/registrationContext"
import { useRegistrationContext } from "../hook/useRegistration"

function Steps() {
  const { state } = useRegistrationContext()
  const steps = [<StepAttendee key="att" />, <StepReview key="rev" />, <StepPayment key="pay" />]
  return <>{steps[state.step]}</>
}
const Register = () => {
  return (
    <RegistrationProvider>
      <div className="mx-auto mt-6 w-full max-w-md sm:max-w-lg md:max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-4">Registration for Nyati Chess Tournament 2025</h1>
        <div className="mb-6 overflow-x-auto"><Progress /></div>
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <Steps />
        </div>
      </div>
    </RegistrationProvider>
  )
}

export default Register

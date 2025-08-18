import Progress from "../component/register/Progress"
import StepAttendee from "../component/register/StepAttendee"
import StepPayment from "../component/register/StepPayment"
import StepReview from "../component/register/StepReview"
import { RegistrationProvider } from "../context/registrationContext"
import { useRegistrationContext } from "../hook/useRegistration"

function Steps() {
    const { state } = useRegistrationContext()
    const steps = [<StepAttendee/>, <StepReview/>, <StepPayment/>]
    return <>{steps[state.step]}</>
}
const Register = () => {

  return (
    <RegistrationProvider>
        <div className="container">
            <Progress />
            <Steps />
        </div>
    </RegistrationProvider>
  )
}

export default Register
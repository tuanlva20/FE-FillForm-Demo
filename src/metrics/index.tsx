// @project
import GTag from './GTag';

const clarityId = import.meta.env.VITE_APP_PUBLIC_CLARITY_ID || '';
const notifyId = import.meta.env.VITE_APP_PUBLIC_NOTIFY_ID || '';
const gaId = import.meta.env.VITE_APP_PUBLIC_ANALYTICS_ID || 'G-ZJ1EC5JF9N';

/***************************  METRICS  ***************************/

export default function Metrics() {
  return (
    <>
      {/* {clarityId && <MicrosoftClarity clarityId={clarityId} />}
      {notifyId && <Notify notifyId={notifyId} />} */}
      {gaId && <GTag gaId={gaId} />}
    </>
  );
}

import { Navigate } from 'react-router-dom';
import { useIsDesktop } from './useIsDesktop';

/** على الديسكتوب: افتح Edit profile افتراضيًا بجانب المنيو */
export default function ProfileDesktopRedirect() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return <Navigate to="/dashboard/profile/edit" replace />;
  }
  return null;
}

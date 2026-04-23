import type {UserModel} from '~/lib/apiModels';
import {getUserSession} from '~/lib/localStorage';

export function useUserSession() {
  const session = useState<UserModel | null>('userSession', () => null);

  onMounted(() => {
    if (!session.value) {
      session.value = getUserSession();
    }
  });

  return session;
}
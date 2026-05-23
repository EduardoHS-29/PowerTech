import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { logoutAction } from "@/app/(auth)/login/actions";
import { authService } from "@/lib/services/auth/auth.service";

export async function Header() {
  const session = await authService.getCurrentSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary-dark">
            {session?.nome?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{session?.nome}</p>
            <p className="text-xs text-gray-500">{session?.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}

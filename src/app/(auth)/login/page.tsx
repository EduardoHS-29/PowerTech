import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
    title: "Entrar",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="flex w-100 justify-center items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg [background:var(--gradient-primary)]">
                            <FontAwesomeIcon icon={faWind} className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">PowerTech</h1>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <LoginForm />
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    Sistema de Gerenciamento de Turbinas e Análises Técnicas
                </p>
            </div>
        </div>
    );
}

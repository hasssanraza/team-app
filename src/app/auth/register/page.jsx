import SignUpForm from '@/components/auth/SignUpForm';

export default function RegisterPage() {
  return (
    <div className="container flex h-[calc(100vh-3rem)] w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to create your account
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
} 
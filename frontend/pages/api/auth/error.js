import Link from 'next/link';

const ErrorPage = ({ error }) => {
  // Define a user-friendly message based on the error
  const errorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'Access denied. Please try again or use a different account.';
      case 'email_exists':
        return  router.push('/calendar');
      case 'database_error':
        return 'An error occurred while saving your information. Please try again later.';
      default:
        return 'Something went wrong during authentication. Please try again.';
    }
  };

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{errorMessage()}</p>
      <Link href="/auth/login">Go back to Login</Link>
    </div>
  );
};

// Use getServerSideProps to pass the error message to the component
export const getServerSideProps = async (context) => {
  const { error } = context.query;
  return {
    props: {
      error: error || null, 
    },
  };
};

export default ErrorPage;

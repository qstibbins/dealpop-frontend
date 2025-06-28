export default function Login() {
  const handleLogin = () => {
    // Replace with Auth0 or actual login logic later
    alert('Log in clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to DealPop</h1>
        <p className="text-gray-600 mb-6">Track prices. Save money. Get notified.</p>
        <button
          onClick={handleLogin}
          className="bg-accent text-white px-6 py-2 rounded hover:bg-pink-600 w-full"
        >
          Log in with Google
        </button>
      </div>
    </div>
  );
}
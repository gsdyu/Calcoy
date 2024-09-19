import { useState } from 'react';
import { useRouter } from 'next/router';

const EnterUsername = () => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { email } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');  // Clear any previous error message

    // Send username to the server to update the user in the database
    const res = await fetch('/api/auth/enter-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email }),
    });

    if (res.ok) {
      // Redirect to the calendar page
      router.push('/calendar');
    } else {
      // Handle error response
      const data = await res.json();
      setErrorMessage(data.error || 'An error occurred');
    }
  };

  return (
    <div>
      <h1>Enter your username</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EnterUsername;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import OrganizationForm from './OrganizationForm';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <Link to="/form" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Go to Organization Form
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  Home
                </Link>
                <Link to="/form" className="ml-6 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out">
                  Organization Form
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <header className="py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<OrganizationForm />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
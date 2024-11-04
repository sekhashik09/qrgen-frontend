import React, { useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { PropagateLoader } from 'react-spinners';

function App() {
  const [text, setText] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [size, setSize] = useState(150);
  const [color, setColor] = useState('#000000');
  const [loading, setLoading] = useState(false);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    setQrCodeImage('');
    setDownloadLink('');

    if (!isValidUrl(text)) {
      toast.error('😞 Please enter a valid URL.');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post('https://qrgen-backend-cpu1.onrender.com/generate-qr', { text, color, width: size, height: size }, {
        responseType: 'blob',
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      setDownloadLink(downloadUrl);

      const qrCodeData = await axios.post('https://api.qrserver.com/v1/create-qr-code/', null, {
        params: {
          data: text,
          size: `${size}x${size}`,
          color: color.replace('#', ''),
        },
        responseType: 'blob',
      });

      const qrCodeBlob = new Blob([qrCodeData.data], { type: 'image/png' });
      const qrCodeUrl = window.URL.createObjectURL(qrCodeBlob);
      setQrCodeImage(qrCodeUrl);

      toast.success('😮 Your QR Code is Ready!');
    } catch (err) {
      toast.error('😞 Failed to generate QR. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = 'qr_code.pdf';
    link.click();
    toast.success('🤔 Download started!');

    setTimeout(() => {
      toast.success('😊 Download completed!');
      window.URL.revokeObjectURL(downloadLink); 
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-5">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full flex flex-col lg:flex-row items-center lg:space-x-10">
        <div className="flex-grow">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">QR Code Generator</h1>

          <form onSubmit={handleGenerateQR} className="space-y-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a valid URL"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring focus:outline-none focus:ring-blue-300 transition"
            />

            <div className="flex items-center justify-between">
              <label htmlFor="size" className="text-lg text-gray-700">QR Code Size (px):</label>
              <input
                id="size"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                min="50"
                max="500"
                className="p-2 border border-gray-300 rounded-xl w-24 focus:ring focus:outline-none focus:ring-blue-300 transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="color" className="text-lg text-gray-700">Choose Color:</label>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? (
                <PropagateLoader size={10} text-alignment="center" color="#28dac4" />
              ) : 'Generate Your QR Code'}
            </button>
          </form>

          <Transition
            show={qrCodeImage}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {qrCodeImage && (
              <div className="mt-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800">QR Code Preview:</h2>
                <img
                  src={qrCodeImage}
                  alt="Generated QR Code"
                  className="mx-auto my-4 border border-gray-300 rounded-lg shadow-md"
                  style={{ width: `${size}px`, height: `${size}px` }}
                />
              </div>
            )}
          </Transition>

          <Transition
            show={downloadLink}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {downloadLink && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleDownload}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition"
                >
                  Download QR Code as PDF (Size: {size}px)
                </button>
              </div>
            )}
          </Transition>
        </div>

        <div className="flex-shrink-0 mt-8 lg:mt-0 lg:ml-10">
          <img
            src="https://nordvpn.com/wp-content/uploads/blog-social-how-to-scan-QR-code-1200x628-1.jpg"
            alt="Decorative"
            className="rounded-lg shadow-lg"
            style={{ width: '300px', height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

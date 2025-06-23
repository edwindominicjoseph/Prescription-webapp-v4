export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-black text-white text-center text-sm py-4 w-full mt-8">
      © {new Date().getFullYear()} Prescription Fraud Detection Platform. All rights reserved.
    </footer>
  );
}

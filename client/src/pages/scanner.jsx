import React from "react";
import { QRCodeSVG } from "qrcode.react";

function ScanQR() {
    return (
        <div className="max-w-3xl mx-auto text-slate-200">

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-300">
                    Login QR Code
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Scan this QR code to open the login page
                </p>
            </div>

            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-10 flex justify-center">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <QRCodeSVG
                        value={`${process.env.REACT_APP_FRONTEND_URL}/`}
                        size={220}
                    />
                </div>
            </div>

        </div>
    );
}

export default ScanQR;
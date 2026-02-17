"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    helperText,
    leftIcon,
    className = "",
    id,
    ...props
}: InputProps) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-gray-700 font-medium text-sm"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            w-full py-2.5 border rounded-lg transition-all duration-200 
            focus:outline-none focus:ring-2 
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${leftIcon ? "pl-10 pr-4" : "px-4"}
            ${error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-red-600 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p className="text-gray-500 text-xs mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
}

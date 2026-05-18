import React from 'react'

export default function ErrorBoundary({ children }) {
    const [hasError, setHasError] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const handleError = (event) => {
            setHasError(true)
            setError(event.message)
        }

        window.addEventListener('error', handleError)
        return () => window.removeEventListener('error', handleError)
    }, [])

    if (hasError) {
        return (
            <div className="p-6 max-w-md mx-auto mt-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
                    <p className="text-red-700 text-sm mb-4">{error || 'An unexpected error occurred'}</p>
                    <button
                        onClick={() => {
                            setHasError(false)
                            setError(null)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    return children
}

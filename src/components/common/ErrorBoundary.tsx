import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex items-center justify-center bg-dark-bg p-8">
                    <div className="max-w-2xl w-full">
                        <div className="card p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                            <p className="text-gray-400 mb-6">
                                An unexpected error occurred. This has been logged for investigation.
                            </p>

                            {this.state.error && (
                                <div className="mb-6 text-left">
                                    <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
                                        <p className="text-sm font-mono text-red-400 mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                                                    Stack trace
                                                </summary>
                                                <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-64">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 justify-center">
                                <button onClick={this.handleReset} className="btn btn-primary">
                                    Reload Application
                                </button>
                                <button
                                    onClick={() => window.history.back()}
                                    className="btn btn-secondary"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

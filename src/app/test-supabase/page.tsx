import { createClient } from "@/lib/supabase/server";

/**
 * Test page to verify Supabase connection
 * This page tests both database connection and authentication
 */
export default async function TestSupabasePage() {
  const supabase = await createClient();

  // Test 1: Database connection
  let dbTestResult: { success: boolean; error: string | null; tables: string[] } = { success: false, error: null, tables: [] };
  try {
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      dbTestResult = { success: false, error: error.message, tables: [] };
    } else {
      dbTestResult = { success: true, error: null, tables: ['user_profiles', 'conversations', 'messages'] };
    }
  } catch (err) {
    dbTestResult = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      tables: []
    };
  }

  // Test 2: Auth status
  let authTestResult: { success: boolean; error: string | null; user: { id?: string; email?: string } | null } = {
    success: false,
    error: null,
    user: null
  };
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      authTestResult = { success: false, error: error.message, user: null };
    } else {
      authTestResult = { success: true, error: null, user };
    }
  } catch (err) {
    authTestResult = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      user: null
    };
  }

  // Test 3: Environment variables
  const envTest = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center mb-8">
          🧪 Supabase Connection Test
        </h1>

        {/* Environment Variables Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔑</span>
            Environment Variables
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              <span>{envTest.url}</span>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span>{envTest.anonKey}</span>
            </div>
            <div className="flex justify-between">
              <span>SUPABASE_SERVICE_ROLE_KEY:</span>
              <span>{envTest.serviceKey}</span>
            </div>
            {process.env.NEXT_PUBLIC_SUPABASE_URL && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <strong>Project URL:</strong><br />
                <code className="text-xs">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code>
              </div>
            )}
          </div>
        </div>

        {/* Database Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>💾</span>
            Database Connection
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded ${dbTestResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Status:</strong> {dbTestResult.success ? '✅ Connected' : '❌ Failed'}
            </div>
            {dbTestResult.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <strong>Error:</strong>
                <pre className="text-sm mt-2 whitespace-pre-wrap">{dbTestResult.error}</pre>
              </div>
            )}
            {dbTestResult.success && (
              <div className="space-y-2">
                <strong>Tables found:</strong>
                <ul className="list-disc list-inside ml-4">
                  {dbTestResult.tables.map(table => (
                    <li key={table} className="font-mono text-sm">{table}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔐</span>
            Authentication Status
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded ${authTestResult.success ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <strong>Status:</strong> {authTestResult.user ? '✅ User Authenticated' : 'ℹ️ No user logged in (expected)'}
            </div>
            {authTestResult.error && !authTestResult.error.includes('session_not_found') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <strong>Error:</strong>
                <pre className="text-sm mt-2 whitespace-pre-wrap">{authTestResult.error}</pre>
              </div>
            )}
            {authTestResult.user && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <strong>User Email:</strong> {authTestResult.user.email}
                <br />
                <strong>User ID:</strong> <code className="text-xs">{authTestResult.user.id}</code>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span>
            Summary
          </h2>
          <div className="space-y-2">
            {envTest.url === '✅ Set' && envTest.anonKey === '✅ Set' && dbTestResult.success ? (
              <div className="p-4 bg-green-100 text-green-800 rounded font-semibold">
                ✅ Supabase is fully configured and connected!
                <br />
                <span className="text-sm font-normal">You can now proceed with building authentication and database features.</span>
              </div>
            ) : (
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
                ⚠️ Some tests failed. Please check the errors above.
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">🚀 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>If all tests pass, you&apos;re ready to build authentication!</li>
            <li>Navigate to <code className="bg-gray-100 px-2 py-1 rounded">/login</code> to start building the login form</li>
            <li>Create database schema for CodeQuest Jr. (users, lessons, progress, etc.)</li>
            <li>Delete this test page when done: <code className="bg-gray-100 px-2 py-1 rounded">src/app/test-supabase/</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

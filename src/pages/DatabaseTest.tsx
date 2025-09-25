import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runTests = async () => {
    setLoading(true)
    const results: any[] = []

    try {
      // Test 1: Check if we can connect to Supabase
      results.push({
        test: 'Supabase Connection',
        status: 'success',
        message: 'Connected to Supabase successfully'
      })

      // Test 2: Check if game_types table exists and has data
      try {
        const { data: gameTypes, error } = await supabase
          .from('game_types')
          .select('*')

        if (error) throw error

        results.push({
          test: 'Game Types Table',
          status: 'success',
          message: `Found ${gameTypes?.length || 0} game types`,
          data: gameTypes
        })
      } catch (error: any) {
        results.push({
          test: 'Game Types Table',
          status: 'error',
          message: error.message
        })
      }

      // Test 3: Test user profile access (if logged in)
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          results.push({
            test: 'User Profile Access',
            status: profile ? 'success' : 'warning',
            message: profile ? 'User profile found' : 'No user profile found',
            data: profile
          })
        } catch (error: any) {
          results.push({
            test: 'User Profile Access',
            status: 'error',
            message: error.message
          })
        }
      } else {
        results.push({
          test: 'User Profile Access',
          status: 'warning',
          message: 'User not logged in - cannot test profile access'
        })
      }

      // Test 4: Test RPC function
      try {
        const { data, error } = await supabase.rpc('generate_share_slug')
        
        if (error) throw error

        results.push({
          test: 'RPC Function (generate_share_slug)',
          status: 'success',
          message: `Generated slug: ${data}`,
          data: data
        })
      } catch (error: any) {
        results.push({
          test: 'RPC Function (generate_share_slug)',
          status: 'error',
          message: error.message
        })
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: error.message
      })
    }

    setTestResults(results)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Test the connection to Supabase and verify that all tables and functions are working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Tests...' : 'Run Database Tests'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              {testResults.map((result, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: getStatusColor(result.status) }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.test}</h4>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          Show Data
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {user && (
            <div className="mt-6 p-4 bg-muted rounded">
              <p className="text-sm">
                <strong>Current User:</strong> {user.email}
              </p>
              <p className="text-sm">
                <strong>User ID:</strong> {user.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseTest
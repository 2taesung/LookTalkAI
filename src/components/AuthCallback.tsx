import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          return
        }

        if (data.session) {
          setSuccess(true)
          // 성공 메시지를 잠시 보여준 후 홈으로 리다이렉트
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
        } else {
          // URL에서 토큰 확인
          const accessToken = searchParams.get('access_token')
          const refreshToken = searchParams.get('refresh_token')
          
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (sessionError) {
              setError(sessionError.message)
            } else {
              setSuccess(true)
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 2000)
            }
          } else {
            setError('인증 토큰을 찾을 수 없습니다.')
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('예상치 못한 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {loading && (
          <>
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              이메일 인증 처리 중...
            </h2>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </>
        )}

        {success && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              이메일 인증 완료!
            </h2>
            <p className="text-gray-600 mb-4">
              계정이 성공적으로 인증되었습니다.
            </p>
            <p className="text-sm text-gray-500">
              곧 홈페이지로 이동합니다...
            </p>
          </>
        )}

        {error && (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              인증 실패
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
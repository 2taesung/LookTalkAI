import React, { useState, useRef } from 'react'
import { Upload, Camera, X, Image as ImageIcon, AlertCircle, Settings } from 'lucide-react'
import { Button } from './ui/Button'

interface PhotoUploaderProps {
  onImageSelect: (imageData: string) => void
  selectedImage?: string
  onClearImage?: () => void
  disabled?: boolean
  language?: string
}

export function PhotoUploader({ onImageSelect, selectedImage, onClearImage, disabled, language = 'ko' }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const getText = (ko: string, en: string, zh: string) => {
    switch (language) {
      case 'en': return en
      case 'zh': return zh
      default: return ko
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(getText('이미지 파일만 업로드 가능합니다.', 'Only image files can be uploaded.', '只能上传图像文件。'))
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert(getText('파일 크기는 10MB 이하여야 합니다.', 'File size must be under 10MB.', '文件大小必须小于10MB。'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onImageSelect(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const getPermissionErrorMessage = (error: any) => {
    const errorMessage = error?.message || error?.name || ''
    
    if (errorMessage.includes('Permission denied') || errorMessage.includes('Permission dismissed') || errorMessage.includes('NotAllowedError')) {
      return getText(
        '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.',
        'Camera permission was denied. Please allow camera access in your browser settings.',
        '相机权限被拒绝。请在浏览器设置中允许相机访问。'
      )
    }
    
    if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
      return getText(
        '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.',
        'Camera not found. Please check if your camera is connected.',
        '找不到相机。请检查您的相机是否已连接。'
      )
    }
    
    if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
      return getText(
        '카메라가 다른 애플리케이션에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.',
        'Camera is being used by another application. Please close other apps and try again.',
        '相机正被其他应用程序使用。请关闭其他应用程序后重试。'
      )
    }
    
    return getText(
      '카메라에 접근할 수 없습니다. 브라우저 설정에서 카메라 권한을 확인해주세요.',
      'Cannot access camera. Please check camera permissions in browser settings.',
      '无法访问相机。请检查浏览器设置中的相机权限。'
    )
  }

  const startCamera = async () => {
    if (disabled) return

    try {
      setCameraError(null)
      setIsCapturing(true)
      
      // 모바일 기기 감지
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // 모바일에 최적화된 카메라 설정
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // 전면 카메라 우선
          width: { ideal: isMobile ? 720 : 1280 },
          height: { ideal: isMobile ? 1280 : 720 },
          aspectRatio: isMobile ? 9/16 : 16/9
        },
        audio: false
      }
      
      console.log('📱 카메라 접근 시도 (모바일:', isMobile, ')')
      
      // 카메라 권한 요청 및 스트림 시작
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // 모바일에서 자동 재생을 위한 설정
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        videoRef.current.muted = true
        
        // 비디오 로드 완료 후 재생
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.error('비디오 재생 실패:', error)
            })
          }
        }
      }
      
      console.log('✅ 카메라 접근 성공')
      
    } catch (error) {
      console.error('카메라 접근 실패:', error)
      const errorMessage = getPermissionErrorMessage(error)
      setCameraError(errorMessage)
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // 캔버스 크기를 비디오 크기에 맞춤
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 캔버스를 base64 이미지로 변환
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // 이미지 선택 콜백 호출
    onImageSelect(imageData)
    
    // 카메라 정리
    stopCamera()
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraError(null)
    setIsCapturing(false)
  }

  const retryCamera = () => {
    setCameraError(null)
    startCamera()
  }

  const openBrowserSettings = () => {
    // 브라우저별 설정 페이지 열기 시도
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) {
      window.open('chrome://settings/content/camera', '_blank')
    } else if (userAgent.includes('firefox')) {
      window.open('about:preferences#privacy', '_blank')
    } else if (userAgent.includes('safari')) {
      // Safari는 직접 설정 페이지를 열 수 없음
      alert(getText(
        'Safari에서는 설정 > Safari > 카메라에서 권한을 변경할 수 있습니다.',
        'In Safari, you can change permissions in Settings > Safari > Camera.',
        '在Safari中，您可以在设置 > Safari > 相机中更改权限。'
      ))
    } else {
      // 일반적인 안내
      alert(getText(
        '브라우저 설정에서 카메라 권한을 변경해주세요.',
        'Please change camera permissions in your browser settings.',
        '请在浏览器设置中更改相机权限。'
      ))
    }
  }

  // 카메라 에러 표시
  if (cameraError) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 text-lg">
            {getText('카메라 접근 오류', 'Camera Access Error', '相机访问错误')}
          </h3>
          
          <p className="text-sm text-red-700 mb-4 leading-relaxed">
            {cameraError}
          </p>
          
          <div className="space-y-3">
            <div className="text-xs text-red-600 bg-red-100 rounded-lg p-3">
              <p className="font-medium mb-1">
                {getText('해결 방법:', 'How to fix:', '解决方法：')}
              </p>
              <ol className="text-left space-y-1 list-decimal list-inside">
                <li>{getText('브라우저 주소창 왼쪽의 카메라 아이콘을 클릭하세요', 'Click the camera icon in your browser address bar', '点击浏览器地址栏左侧的相机图标')}</li>
                <li>{getText('카메라 권한을 "허용"으로 변경하세요', 'Change camera permission to "Allow"', '将相机权限更改为"允许"')}</li>
                <li>{getText('페이지를 새로고침하고 다시 시도하세요', 'Refresh the page and try again', '刷新页面并重试')}</li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={retryCamera}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <Camera className="w-4 h-4" />
                <span>{getText('다시 시도', 'Try Again', '重试')}</span>
              </Button>
              <Button
                onClick={openBrowserSettings}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Settings className="w-4 h-4" />
                <span>{getText('브라우저 설정', 'Browser Settings', '浏览器设置')}</span>
              </Button>
              <Button
                onClick={() => setCameraError(null)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{getText('파일 업로드로 돌아가기', 'Back to File Upload', '返回文件上传')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 카메라 모드일 때의 UI
  if (isCapturing) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 bg-black">
          <video
            ref={videoRef}
            className="w-full h-64 sm:h-80 object-cover"
            autoPlay
            playsInline
            muted
            webkit-playsinline="true"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* 카메라 컨트롤 */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              onClick={capturePhoto}
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-white text-purple-600 hover:bg-gray-100"
            >
              <Camera className="w-8 h-8" />
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-black/50 text-white border-white hover:bg-black/70"
            >
              <X className="w-8 h-8" />
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            📷 {getText('사진을 촬영하려면 카메라 버튼을 누르세요', 'Press the camera button to take a photo', '按相机按钮拍照')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getText('취소하려면 X 버튼을 클릭하세요', 'Click X button to cancel', '点击X按钮取消')}
          </p>
        </div>
      </div>
    )
  }

  if (selectedImage) {
    return (
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-white shadow-lg">
          <div className="w-full max-h-[70vh] overflow-hidden">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-auto object-contain max-h-[70vh]"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
          {onClearImage && (
            <button
              onClick={onClearImage}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            📸 {getText('사진이 업로드되었습니다', 'Photo has been uploaded', '照片已上传')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getText('다른 사진을 선택하려면 위의 X 버튼을 클릭하세요', 'Click the X button above to select a different photo', '点击上方的X按钮选择其他照片')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-purple-500 bg-purple-50 scale-105' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-teal-100 rounded-full flex items-center justify-center">
              {isDragging ? (
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {isDragging 
                ? getText('사진을 여기에 놓으세요', 'Drop your photo here', '将照片放在这里') 
                : getText('사진을 업로드하세요', 'Upload your photo', '上传您的照片')
              }
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {getText('드래그 앤 드롭하거나 클릭하여 선택하세요', 'Drag & drop or click to select', '拖放或点击选择')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                <Upload className="w-4 h-4" />
                <span>{getText('파일 선택', 'Select File', '选择文件')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  startCamera()
                }}
              >
                <Camera className="w-4 h-4" />
                <span>{getText('카메라 촬영', 'Take Photo', '拍照')}</span>
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>{getText('지원 형식: JPG, PNG, GIF (최대 10MB)', 'Supported formats: JPG, PNG, GIF (max 10MB)', '支持格式：JPG、PNG、GIF（最大10MB）')}</p>
            <p>💡 {getText('셀피나 인물 사진이 가장 좋은 결과를 제공합니다', 'Selfies or portrait photos provide the best results', '自拍或人像照片效果最佳')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
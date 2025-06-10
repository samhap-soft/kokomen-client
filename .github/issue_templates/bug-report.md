name: 버그 제보
description: 동작 중 발생한 버그를 제보합니다.
title: "[Bug] "
labels: [bug]
body:
  - type: textarea
    id: bug-desc
    attributes:
      label: 🐞 버그 설명
      description: 어떤 문제가 발생했는지 간단히 설명해주세요.
      placeholder: ex. "질문 제출" 버튼을 눌러도 아무 동작이 일어나지 않습니다.
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: 📋 재현 방법
      description: 버그를 재현하기 위한 구체적인 단계가 있다면 작성해주세요.
      placeholder: |
        1. 로그인
        2. 인터뷰 시작
        3. 응답 입력 후 제출
    validations:
      required: false

  - type: input
    id: env
    attributes:
      label: 💻 환경 정보
      description: 사용 중인 브라우저 또는 운영체제 정보
      placeholder: ex. Chrome 125, macOS Sonoma
    validations:
      required: false

  - type: textarea
    id: screenshot
    attributes:
      label: 📷 스크린샷
      description: 가능하면 스크린샷을 첨부해주세요.
      placeholder: (파일 업로드 가능)
    validations:
      required: false

name: 논의 제안 (Discussion)
description: 팀 내 논의가 필요한 주제를 작성합니다.
title: "[Discussion] "
labels: [discussion]
body:
  - type: textarea
    id: topic
    attributes:
      label: 🗣 논의 주제
      description: 논의하고 싶은 주제나 문제를 명확히 적어주세요.
      placeholder: 예) 인터뷰 기능의 로딩 처리 방식 리팩토링

    validations:
      required: true

  - type: textarea
    id: background
    attributes:
      label: 📚 배경 및 맥락
      description: 이 주제를 왜 논의하고 싶은지, 어떤 상황에서 문제를 느꼈는지를 설명해주세요.
      placeholder: 예) 현재 인터뷰 응답 전송 시 상태 관리가 명확하지 않아 유지보수에 어려움이 있음

    validations:
      required: false

  - type: textarea
    id: suggestions
    attributes:
      label: 💡 제안 또는 아이디어
      description: 논의하고 싶은 대안이나 아이디어가 있다면 작성해주세요.
      placeholder: |
        - 상태 관리를 useReducer로 통합
        - loading 상태를 명시적으로 구분
        - 페이지 이동을 async action으로 분리

    validations:
      required: false

  - type: textarea
    id: open-questions
    attributes:
      label: ❓ 열려 있는 질문
      description: 논의가 필요한 포인트나 결정해야 할 내용을 정리해주세요.
      placeholder: |
        - 현재 로딩 처리 방식을 어떤 방식으로 바꾸는 게 적절할까?
        - 성능 영향은 없을까?

    validations:
      required: false

import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";

export enum CategoryType {
  ALGORITHM_DATA_STRUCTURE = "ALGORITHM_DATA_STRUCTURE",
  DATABASE = "DATABASE",
  NETWORK = "NETWORK",
  OPERATING_SYSTEM = "OPERATING_SYSTEM",
  JAVA_SPRING = "JAVA_SPRING",
  INFRA = "INFRA",
  FRONTEND = "FRONTEND",
  REACT = "REACT",
  JAVASCRIPT_TYPESCRIPT = "JAVASCRIPT_TYPESCRIPT"
}

registerEnumType(CategoryType, {
  name: "CategoryType"
});

const CATEGORY_DATA: Record<
  CategoryType,
  { title: string; description: string; imageUrl: string }
> = {
  [CategoryType.ALGORITHM_DATA_STRUCTURE]: {
    title: "알고리즘/자료구조",
    description: `
        알고리즘과 자료구조는 문제를 효율적으로 해결하기 위한 핵심 
요소입니다.
        자료구조는 데이터를 저장하고 관리하는 방법을 정의하며, 
배열·리스트·스택·큐·트리·그래프 등 다양한 구조를 통해 데이터를 
체계적으로 다룰 수 있습니다.
        알고리즘은 이러한 자료구조를 기반으로 문제를 해결하는 단계별
 절차를 의미하며, 정렬·탐색·그래프 탐색·동적 프로그래밍 등 다양한 
기법이 존재합니다.
        적절한 자료구조와 알고리즘을 선택하고 구현하는 것은 
프로그램의 성능과 효율성을 결정짓는 중요한 요소입니다.
      `,
    imageUrl: "kokomen-algorithm-data-structure.png"
  },
  [CategoryType.DATABASE]: {
    title: "데이터베이스",
    description: `
        데이터베이스는 대량의 데이터를 효율적으로 저장하고 관리하는 
시스템입니다.
        관계형 데이터베이스(RDBMS)는 테이블 구조와 SQL을 기반으로 
데이터를 관리하고,
        NoSQL은 비정형 데이터와 대규모 분산 처리를 지원합니다.
        적절한 인덱스 설계는 빠른 데이터 조회와 시스템 성능에 중요한
 영향을 미칩니다.
      `,
    imageUrl: "kokomen-database-v2.png"
  },
  [CategoryType.NETWORK]: {
    title: "네트워크",
    description: `
        네트워크는 여러 컴퓨터와 시스템이 서로 데이터를 주고받을 수 
있도록 구성된 통신 구조입니다.
        네트워크 계층 구조(OSI 7계층, TCP/IP 4계층), 프로토콜(TCP, 
UDP, HTTP 등),
        라우팅, 패킷 전송 방식 등 다양한 개념을 이해하는 것이 
네트워크의 핵심입니다.
      `,
    imageUrl: "kokomen-network-v2.png"
  },
  [CategoryType.OPERATING_SYSTEM]: {
    title: "운영체제",
    description: `
        운영체제는 하드웨어와 소프트웨어 자원을 효율적으로 관리하고,
 사용자와 응용 프로그램이 시스템을 효과적으로 사용할 수 있도록 
지원하는 핵심 소프트웨어입니다.
        프로세스 및 스레드 관리, 메모리 관리, 파일 시스템, 
입출력(I/O) 제어, 그리고 CPU 스케줄링과 같은 기능을 담당합니다.
        OS의 구조와 동작 원리를 이해하는 것은 시스템 개발 및 
최적화의 기초가 됩니다.
      `,
    imageUrl: "kokomen-operating-system-v2.png"
  },
  [CategoryType.JAVA_SPRING]: {
    title: "자바/스프링",
    description: `
        자바와 스프링은 안정적이고 확장성 있는 백엔드 개발을 위한 
핵심 기술입니다.
        자바는 강력한 객체지향 언어로, 대규모 시스템에서도 일관성과 
유지보수성을 보장합니다.
        스프링은 의존성 주입, 트랜잭션 관리, 보안, 데이터 접근 등 
백엔드 개발에 필수적인 기능을 제공하여 복잡한 애플리케이션을 
효율적으로 구현할 수 있게 합니다.
        특히 스프링 부트를 활용하면 설정과 배포가 간소화되어, 빠르게
 안정적인 서비스를 개발하고 운영할 수 있습니다.
      `,
    imageUrl: "kokomen-java-spring.png"
  },
  [CategoryType.INFRA]: {
    title: "인프라",
    description: `
        인프라는 안정적이고 확장 가능한 서비스를 구축하기 위해 
필수적인 기반 기술을 의미합니다.
        데이터베이스는 서비스의 핵심 데이터를 안전하게 저장하고, 
Redis와 같은 인메모리 캐시는
        빠른 응답 속도를 보장합니다. Kafka와 같은 메시지 큐는 대규모
 트래픽 환경에서도 안정적인
        비동기 처리를 가능하게 합니다. 이러한 인프라 기술들은 눈에 
잘 드러나지는 않지만,
        대규모 서비스의 안정성과 성능을 지탱하는 든든한 토대가 되며,
 백엔드 개발자가 반드시
        이해하고 다뤄야 할 영역입니다.
      `,
    imageUrl: "kokomen-infra.png"
  },
  [CategoryType.FRONTEND]: {
    title: "프론트엔드",
    description: `
        프론트엔드 전반적인 지식에 대한 문제가 출제됩니다. 특히, 
프론트엔드 개발에서 필요한 실무적 지식이나 브라우저에 관한 심도 깊은
 질문들이 출제됩니다.    
      `,
    imageUrl: "kokomen-frontend.png"
  },
  [CategoryType.REACT]: {
    title: "리액트",
    description: `
        리액트는 사용자 인터페이스를 만들기 위한 자바스크립트 
라이브러리입니다.
        리액트에 관한 지식들을 중심으로 출제됩니다. 특히, 리액트에서
 사용되는 API나 리액트 내에서 사용되는 주요 기술들이 출제됩니다.
      `,
    imageUrl: "kokomen-react.png"
  },
  [CategoryType.JAVASCRIPT_TYPESCRIPT]: {
    title: "자바스크립트/타입스크립트",
    description: `
        자바스크립트는 웹 브라우저와 서버에서 실행되는 동적 
프로그래밍 언어로, 현대 웹 개발의 핵심 기술입니다.
        주로 자바스크립트의 언어에 대한 이해도를 묻는 질문과 
자바스크립트를 동작시키는 엔진, 추가적으로 정적 분석을 위한 
타입스크립트에 대한 질문 또한 일부 출제됩니다.
      `,
    imageUrl: "kokomen-javascript-typescript.png"
  }
};

@ObjectType()
export class Category {
  @Field(() => CategoryType)
  type: CategoryType;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  imageUrl: string;

  constructor(
    type: CategoryType,
    title: string,
    description: string,
    imageUrl: string
  ) {
    this.type = type;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  static getCategories(): Category[] {
    const BASE_URL = process.env.CLOUD_FRONT_DOMAIN_URL + "category-image/";
    return Object.values(CategoryType).map((type: CategoryType) => {
      const data = CATEGORY_DATA[type];
      return new Category(
        type,
        data.title,
        data.description,
        BASE_URL + data.imageUrl
      );
    });
  }
}

import { RecruitFilterRequest } from "@kokomen/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer
} from "react";

const RecruitFilterContext = createContext<{
  filters: RecruitFilterRequest;
  dispatch: Dispatch<RecruitFilterAction>;
}>({
  filters: {
    careerMin: 0,
    careerMax: 10,
    region: [],
    employeeType: [],
    education: [],
    employment: [],
    deadlineType: []
  },
  dispatch: () => {}
});

type RecruitFilterAction =
  | {
      type: "SET_CAREER_LIMIT";
      careerMin: number;
      careerMax: number;
    }
  | {
      type: "SET_REGION";
      region: string;
    }
  | {
      type: "SET_EMPLOYEE_TYPE";
      employeeType: string;
    }
  | {
      type: "SET_EDUCATION";
      education: string;
    }
  | {
      type: "SET_EMPLOYMENT";
      employment: string;
    }
  | {
      type: "SET_DEADLINE_TYPE";
      deadlineType: string;
    };

const recruitFilterReducer = (
  state: RecruitFilterRequest,
  action: RecruitFilterAction
) => {
  switch (action.type) {
    case "SET_CAREER_LIMIT":
      return {
        ...state,
        careerMin: action.careerMin,
        careerMax: action.careerMax
      };
    case "SET_REGION":
      if (state.region.includes(action.region)) {
        return {
          ...state,
          region: state.region.filter((region) => region !== action.region)
        };
      }
      return {
        ...state,
        region: [...state.region, action.region]
      };
    case "SET_EMPLOYEE_TYPE":
      if (state.employeeType.includes(action.employeeType)) {
        return {
          ...state,
          employeeType: state.employeeType.filter(
            (employeeType) => employeeType !== action.employeeType
          )
        };
      }
      return {
        ...state,
        employeeType: [...state.employeeType, action.employeeType]
      };
    case "SET_EDUCATION":
      if (state.education.includes(action.education)) {
        return {
          ...state,
          education: state.education.filter(
            (education) => education !== action.education
          )
        };
      }
      return {
        ...state,
        education: [...state.education, action.education]
      };
    case "SET_EMPLOYMENT":
      if (state.employment.includes(action.employment)) {
        return {
          ...state,
          employment: state.employment.filter(
            (employment) => employment !== action.employment
          )
        };
      }
      return {
        ...state,
        employment: [...state.employment, action.employment]
      };
    case "SET_DEADLINE_TYPE":
      if (state.deadlineType.includes(action.deadlineType)) {
        return {
          ...state,
          deadlineType: state.deadlineType.filter(
            (deadlineType) => deadlineType !== action.deadlineType
          )
        };
      }
      return {
        ...state,
        deadlineType: [...state.deadlineType, action.deadlineType]
      };
    default:
      return state;
  }
};

export function RecruitFilterProvider({ children }: { children: ReactNode }) {
  const [filters, dispatch] = useReducer(recruitFilterReducer, {
    careerMin: 0,
    careerMax: 10,
    region: [],
    employeeType: [],
    education: [],
    employment: [],
    deadlineType: []
  });
  return (
    <RecruitFilterContext.Provider value={{ filters, dispatch }}>
      {children}
    </RecruitFilterContext.Provider>
  );
}

export const useRecruitFilter = () => {
  const context = useContext(RecruitFilterContext);
  if (!context) {
    throw new Error(
      "useRecruitFilter must be used within a RecruitFilterProvider"
    );
  }
  return context;
};

import { GetServerSidePropsResult } from "next";

export default function AdminIndex() {
  return null;
}

export const getServerSideProps = async (): Promise<
  GetServerSidePropsResult<Record<string, never>>
> => {
  return {
    redirect: {
      destination: "/admin/payments",
      permanent: false
    }
  };
};

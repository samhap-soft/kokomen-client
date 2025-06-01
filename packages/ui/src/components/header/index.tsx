// import React from "react";
// import "./header.css";
// import { Button } from "components/button/Button.tsx";

// interface BaseUser {
//   username: string;
// }
// interface HeaderProps<TUser extends BaseUser> {
//     user: TUser | null;
//     onLogin: () => void;
//     onLogout: () => void;
// }

// export const Header = <Tuser extends BaseUser>({ user = null, onLogin, onLogout } : HeaderProps<Tuser>) => (
//   <header>
//     <div className="">
//       <div>
//         <h1>꼬꼬면</h1>
//       </div>
//       <div>
//         {user ? (
//           <>
//             <span className="welcome"></span>
//             <Button variant={"outline"} size={"sm"} onClick={onLogout} label="Log out" />
//           </>
//         ) : (
//           <>
//             <Button variant={"outline"} size={"sm"} onClick={onLogin} label="Log in" />
//             <Button
//               variant={"default"} size={"sm"}
//               label="Sign up"
//             />
//           </>
//         )}
//       </div>
//     </div>
//   </header>
// );

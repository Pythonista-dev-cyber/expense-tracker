import icon from '../assets/icon.png';

export function TitleBar() {
  return (
    <div className="titlebar">
      <div className="brand">
        <img src={icon} alt="" className="logo" />
        Expense Tracker
      </div>
    </div>
  );
}

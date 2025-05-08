import wakeupPowered from "../assets/wakeup-powered.svg";

export const WakeupPowered: React.FC = () => {
    return (
        <a href="https://wakeuplabs.io" target="_blank" rel="noopener noreferrer">
            <img src={wakeupPowered} alt="Wakeup Powered" />
        </a>
    );
};
const Header = () => {
    return (
        <box justifyContent="center" alignItems="center" gap={1}>
            <box flexDirection="row" justifyContent="center" alignItems="center" gap={1}>
                <ascii-font font="tiny" text="Open" color="gray" />
                <ascii-font font="tiny" text="Code" />
            </box>
        </box>
    );
};

export default Header;

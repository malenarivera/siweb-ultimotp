export default function SmallButton({content, color, clickFunction, className, disabled}: {content: string, color?: string, className?: string, disabled?:boolean}) {
    if(!color)
        color = 'primary';
    return(
    <button
        type="button"
        onClick={clickFunction}
        className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} px-3 py-1 rounded-sm bg-${color} ${className}`}
        disabled={disabled}
    >
    {content}
    </button>
    );
}
import SmallButton from "../atomos/SmallButton";

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    pageClickHandler: (page: number) => void | Promise<void>;
}

export default function Paginator({currentPage, totalPages, pageClickHandler}: PaginatorProps) {
    return (
        <div className="flex flex-row justify-center">
        {totalPages !== 1 &&
        <SmallButton
            color="transparent"
            clickFunction={() => pageClickHandler((currentPage - 1))}
            className={`font-bold mx-1 ${currentPage == 1 ? 'text-gris': ''}`}
            content="&lt;"
            disabled={currentPage == 1}
        />
        }
            {
                [ ...Array(totalPages).keys() ].map( i => {
                return (
                    <SmallButton
                        disabled={currentPage == (i+1)}
                        color={currentPage == (i+1) ? 'primary' : 'transparent'}
                        className="mx-1"
                        key={i}
                        clickFunction={() => {currentPage != (i+1) ? pageClickHandler((i+1)) : () => {}}}
                        content={`${i+1}`} />
                )
                })
            }
        {totalPages !== 1 && 
        <SmallButton
            color="transparent"
            clickFunction={() => pageClickHandler((currentPage + 1))}
            className={`font-bold mx-1 ${currentPage == totalPages ? 'text-gris': ''}`}
            disabled={currentPage == totalPages}
            content="&gt;" />
        }
    </div>
    )
}
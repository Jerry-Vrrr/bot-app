import React from 'react'
import { Button } from '../ui/button'

const SubmitBtn = ({loading, text}: {loading: boolean, text: string}) => {
    return (
        <div className="flex justify-between items-center flex-col gap-x-5 mt-3">
            <Button disabled={loading} type="submit" className="text-black font-bold px-6 rounded-3xl text-md bg-redOrange hover:bg-[#f9301a]">
                {loading ? "Loading..." : text}
            </Button>
        </div>
    )
}

export default SubmitBtn

export default function ApiRespBuilder(success:boolean, message:string, code: number, data : Record<string, any> | null)
{
        return {success, message, code, data}
}
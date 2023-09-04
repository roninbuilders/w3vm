import { setW3 } from "../store/w3store";
import { ProviderRpcError } from "../types";

export function catchError(e: Error | ProviderRpcError){
  setW3.error(e) 
  setW3.wait(undefined)
  throw e
}
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadS3Folder = downloadS3Folder;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const stream_1 = require("stream");
const util_1 = require("util");
const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
const s3 = new client_s3_1.S3Client({
    region: "auto",
    credentials: {
        accessKeyId: "1520335557fb6dfdd2ea44e0822aa001",
        secretAccessKey: "be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa",
    },
    endpoint: "https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com"
});
// output/asdba
function downloadS3Folder(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const allFiles = yield s3.send(new client_s3_1.ListObjectsV2Command({
            Bucket: 'vercel',
            Prefix: prefix
        }));
        const objects = (_a = allFiles.Contents) !== null && _a !== void 0 ? _a : [];
        const allPromises = objects.map((_a) => __awaiter(this, [_a], void 0, function* ({ Key }) {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!Key) {
                    resolve("");
                    return;
                }
                const finalOutputPath = path.join(__dirname, Key);
                // const outputFile = fs.createWriteStream(finalOutputPath);
                const dirName = path.dirname(finalOutputPath);
                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true });
                }
                const { Body } = yield s3.send(new client_s3_1.GetObjectCommand({
                    Bucket: 'vercel',
                    Key,
                }));
                const outputFile = fs.createWriteStream(finalOutputPath);
                yield streamPipeline(Body, outputFile);
                console.log("Downloaded:", Key);
            }));
        }));
        yield Promise.all(allPromises);
        console.log("all downloads completed");
    });
}

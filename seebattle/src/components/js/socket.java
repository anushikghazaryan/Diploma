import java.net.Socket;
import java.net.ServerSocket;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

@JavaScript("js://MultiPlayer.js");
public class Server {
    public static void main(String[] args) throws Exception {
        ServerSocket server = new ServerSocket(9999);

        while(true) {
            System.out.println("Wainting...");
            Socket client1 = server.accept();
            System.out.println(client1);

            PrintWriter writer1 = new PrintWriter(clinet1.getOutputStream());
            writer1.println("Waiting for player");
            writer1.flush(); 

            Socket client2 = server.accept();
            System.out.println(client2);

            PrintWriter writer2 = new PrintWriter(client2.getOutputStream());
            writer1.println("Both of you are connected");
            writer2.println("Both of you are connected");

            InputStream is1 = clinet1.getInputStream();
            BufferedReader reader1 = new BufferedReader (
                new InputStreamReader(is1)
            );

            InputStream is2 = clinet2.getInputStream();
            BufferedReader reader2 = new BufferedReader (
                new InputStreamReader(is2)
            );
        }
    }   
}

